# Web-o-Builts Backend

This is the Django backend for the Web-o-Builts project.

## Prerequisites
- Python 3.10+
- PostgreSQL

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/TrombokenduShiv/Web-o-Builts.git
   cd Web-o-Builts/backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   Create a `.env` file in the `backend` directory and add the necessary environment variables (e.g., database credentials, secret keys).

5. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Start the development server:**
   ```bash
   python manage.py runserver
   ```
