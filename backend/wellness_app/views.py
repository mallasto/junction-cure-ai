# wellness_app/views.py
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import JournalEntry
import json
from django.core.serializers import serialize
from django.shortcuts import get_object_or_404

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

            return JsonResponse(response_data)

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