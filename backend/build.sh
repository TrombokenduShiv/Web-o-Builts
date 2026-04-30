#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate

# Ensure the default Site exists for django-allauth (SITE_ID = 1)
python manage.py shell -c "
from django.contrib.sites.models import Site
site, created = Site.objects.get_or_create(
    id=1,
    defaults={'domain': 'webobuilts-api.onrender.com', 'name': 'Web-o-Builts API'}
)
if not created:
    site.domain = 'webobuilts-api.onrender.com'
    site.name = 'Web-o-Builts API'
    site.save()
print(f'Site configured: {site.domain}')
"
