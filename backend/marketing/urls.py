from django.urls import path
from .views import AnalyzeGrowthView

urlpatterns = [
    path('analyze-growth/', AnalyzeGrowthView.as_view(), name='analyze-growth'),
]
