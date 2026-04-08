import mailerlite as Mailerlite
from app.core.config import MAILERLITE_API_KEY

client = Mailerlite.Client({
    'api_key': MAILERLITE_API_KEY
})


def create_subscriber(email, first_name):
    try:
        response = client.subscribers.create(
            email, fields={'name': first_name})
        return {'success': True, "data": response}
    except Exception as e:
        print(f"Failed to create subscriber for {email}: {e}")
        return {'success': False,
                "error": "Something rent wrong. Please try again"}


# test_result = create_subscriber("test1@gmail.com", "Testeer")
# print(test_result)
