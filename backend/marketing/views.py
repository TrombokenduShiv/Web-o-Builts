from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
import uuid
import random
from datetime import datetime, timedelta
from .models import Lead

class AnalyzeGrowthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        business_name = request.data.get('business_name', 'Your Business')
        email = request.data.get('email', '')
        
        # Save the lead
        Lead.objects.create(business_name=business_name, email=email)
        
        # Generate mock SEO prediction data
        base_traffic = random.randint(500, 2000)
        
        predicted_growth = []
        current_date = datetime.now()
        for i in range(6):
            month = (current_date + timedelta(days=30 * i)).strftime('%b %Y')
            traffic = int(base_traffic * (1 + (i * 0.15) + random.uniform(-0.05, 0.05)))
            predicted_growth.append({
                'month': month,
                'visitors': traffic
            })
            
        session_id = str(uuid.uuid4())
        
        return Response({
            'business_name': business_name,
            'session_id': session_id,
            'message': 'Mock analysis generated successfully. Ready for Action Center display.',
            'predicted_growth': predicted_growth,
            'projected_increase_percentage': 15 * 5 # ~75% over 6 months
        }, status=status.HTTP_200_OK)
