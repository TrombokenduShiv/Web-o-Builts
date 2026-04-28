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
        seo_score = random.randint(28, 62)
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

        projected_increase = random.randint(65, 120)

        recommendations = [
            {
                'title': 'Technical SEO Overhaul',
                'description': 'Fix crawl errors, improve site speed, and add structured data markup.',
                'impact': 'High',
            },
            {
                'title': 'Content Strategy',
                'description': 'Create targeted blog posts and landing pages for high-intent keywords.',
                'impact': 'High',
            },
            {
                'title': 'Local SEO Optimization',
                'description': 'Claim and optimize Google Business Profile, build local citations.',
                'impact': 'Medium',
            },
            {
                'title': 'Backlink Building',
                'description': 'Earn quality backlinks through guest posts and digital PR campaigns.',
                'impact': 'Medium',
            },
        ]

        # Pick 3 random recommendations
        selected_recs = random.sample(recommendations, 3)

        session_id = str(uuid.uuid4())

        return Response({
            'business_name': business_name,
            'session_id': session_id,
            'seo_score': seo_score,
            'projected_increase_percentage': projected_increase,
            'predicted_growth': predicted_growth,
            'recommendations': selected_recs,
            'summary': f'{business_name} currently has significant untapped growth potential. '
                       f'With targeted SEO improvements, we project a {projected_increase}% increase '
                       f'in organic traffic over 6 months.',
        }, status=status.HTTP_200_OK)
