from django.urls import path
from .views import process_journal_entry, get_all_entries, get_entry_by_id,delete_entry,send_to_llm_and_get_response

urlpatterns = [
    path('entries/', process_journal_entry, name='process_journal_entry'),
    path('entries/all/', get_all_entries, name='get_all_entries'),
    path('entries/<int:id>/', get_entry_by_id, name='get_entry_by_id'),
    path('entries/delete/<int:id>/', delete_entry, name='delete_entry'),
    path('entries/analyse/', send_to_llm_and_get_response, name='analyse_entry')
]
