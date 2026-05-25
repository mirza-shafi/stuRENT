#!/usr/bin/env bash
# Render build script — runs from repo root, delegates to backend/
set -o errexit

cd backend
pip install -r requirements.txt
python manage.py collectstatic --no-input --settings=sturent.settings.production
python manage.py migrate --settings=sturent.settings.production

# Create superuser if it doesn't exist
python manage.py shell --settings=sturent.settings.production -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@sturent.com', 'admin12345')
    print('Superuser created.')
else:
    print('Superuser already exists.')
"
