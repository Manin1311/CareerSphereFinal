#!/usr/bin/env bash
# exit on error
set -o errexit

pip install --upgrade pip
pip install --no-cache-dir -r requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate
python manage.py seed_config_data
python manage.py seed_skills
python manage.py seed_mcq_questions
python manage.py seed_coding_problems
python manage.py seed_imported_data
python manage.py seed_reviews
