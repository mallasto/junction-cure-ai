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
            if getattr(settings, 'ENABLE_LLM_INTEGRATION', False):
                # Fetch all entries from the database
                entries = JournalEntry.objects.all()

                # Extract content from each entry and create a list of content strings
                content_list = [entry.content for entry in entries]

                # Prepare the data to send to the LLM
                data_to_llm = {'entries': content_list}

                # Replace 'https://your-llm-api-endpoint.com' with your actual LLM endpoint
                llm_endpoint = 'https://your-llm-api-endpoint.com'

                # Send data to the LLM using requests.post
                response = requests.post(llm_endpoint, json=data_to_llm)

                # Process the response from the LLM as needed
                if response.status_code == 200:
                    return JsonResponse({'success': 'Journal entry saved and content sent to LLM successfully'})
                else:
                    return JsonResponse({'error': 'Failed to send content to LLM'}, status=response.status_code)

            # If LLM integration is not enabled, return a success response without LLM integration
            return JsonResponse({'success': 'Journal entry saved successfully'})

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON in the request'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

def get_all_entries(request):
    try:
        entries = JournalEntry.objects.all()
        serialized_entries = [
            {'id': entry.id,'content': entry.content, 'timestamp': entry.timestamp}
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
            'timestamp': entry.timestamp
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





