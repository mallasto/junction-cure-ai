# wellness_app/views.py
import traceback
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import requests
from .models import JournalEntry
import json
from django.core.serializers import serialize
from django.shortcuts import get_object_or_404
from django.conf import settings


def send_post_request(api_endpoint, data):
    try:
        response = requests.post(api_endpoint, json=data)
        response.raise_for_status()  # Raises a HTTPError if the HTTP request returned an unsuccessful status code
        return response.json()  # Return the JSON response, if any
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return {}

@csrf_exempt
def process_journal_entry(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))

            # Retrieve the journal entry content
            journal_entry_content = data.get('content', '')

            # Save the journal entry to the database
            new_entry = JournalEntry(content=journal_entry_content)
            new_entry.save()

            # Include the assigned ID in the response
            response_data = {
                'id': new_entry.id,
                'success': 'Journal entry saved successfully'
            }

            # Check if LLM integration is enabled in settings

            # Fetch all entries from the database
            entries = JournalEntry.objects.all()

            # Extract content from each entry and create a list of content strings
            content_list = [entry.content for entry in entries]

            # Prepare the data to send to the LLM
            data_to_llm = {'entries': content_list}
            print(content_list)

            # Replace 'https://your-llm-api-endpoint.com' with your actual LLM endpoint
            llm_endpoint = 'https://ij6j4fcx2khpnas4d33bfor4la0glwzd.lambda-url.eu-central-1.on.aws/'

            # Send data to the LLM using requests.post
            response = send_post_request(llm_endpoint, data=data_to_llm)

            # Process the response from the LLM as needed
            if response:
                new_entry.patient_summary = response['patient']['summary']
                new_entry.patient_feedback = response['patient']['feedback']
                new_entry.therapist_summary = response['therapist']['actions']
                new_entry.therapist_feedback = response['therapist']['symptoms']
                new_entry.save()
                return JsonResponse({'success': 'Journal entry saved and content sent to LLM successfully',"response": response})
            
            else:
                print(response)
                return JsonResponse({'error': 'Failed to send content to LLM'},)

            # If LLM integration is not enabled, return a success response without LLM integration
            return JsonResponse({'success': 'Journal entry saved successfully'})

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON in the request'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

def get_all_entries(request):
    try:
        entries = JournalEntry.objects.all()
        serialized_entries = [
            {'id': entry.id,
             'content': entry.content, 
             'timestamp': entry.timestamp, 
             'patient summary': entry.patient_summary,
             'patient feedback': entry.patient_feedback,
             'therapist summary': entry.therapist_summary,
             'therapist feedback': entry.therapist_feedback
             }
            for entry in entries
        ]
        return JsonResponse({'entries': serialized_entries}, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def get_entry_by_id(request, id):
    try:
        entry = get_object_or_404(JournalEntry, pk=id)
        serialized_entry = {
            'id': entry.id,
            'content': entry.content, 
            'timestamp': entry.timestamp, 
            'patient summary': entry.patient_summary,
            'patient feedback': entry.patient_feedback,
            'therapist summary': entry.therapist_summary,
            'therapist feedback': entry.therapist_feedback
        }
        return JsonResponse({'entry': serialized_entry}, safe=False)
    except JournalEntry.DoesNotExist:
        return JsonResponse({'error': 'Entry not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
# def send_entries_to_llm(request):
#     try:
#         # Fetch all entries from the database
#         entries = JournalEntry.objects.all()

#         # Extract content from each entry and create a list of content strings
#         content_list = [entry.content for entry in entries]

#         # Prepare the data to send to the LLM
#         data_to_llm = {'entries': content_list}

#         # Replace 'https://your-llm-api-endpoint.com' with your actual LLM endpoint
#         llm_endpoint = 'https://your-llm-api-endpoint.com'

#         # Send data to the LLM using requests.post
#         response = requests.post(llm_endpoint, json=data_to_llm)

#         # Process the response from the LLM as needed
#         if response.status_code == 200:
#             return JsonResponse({'success': 'Content sent to LLM successfully'})
#         else:
#             return JsonResponse({'error': 'Failed to send content to LLM'}, status=response.status_code)

#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def delete_entry(request, id):
    if request.method == 'DELETE':
        try:
            # Retrieve the journal entry by ID
            entry = get_object_or_404(JournalEntry, pk=id)

            # Delete the journal entry
            entry.delete()

            return JsonResponse({'success': 'Journal entry deleted successfully'})
        
        except JournalEntry.DoesNotExist:
            return JsonResponse({'error': 'Entry not found'}, status=404)
        except Exception as e:
            print(traceback.format_exc())
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


    
    





