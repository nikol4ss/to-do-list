from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from tasks.notifications import send_test_email

from .serializers import RegisterSerializer, UserProfileSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class TestNotificationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user

        if not user.notifications_enabled:
            return Response(
                {"detail": "Ative as notificações antes de enviar um e-mail de teste."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not send_test_email(recipient=user):
            return Response(
                {
                    "detail": (
                        "Falha ao enviar e-mail de teste. Verifique EMAIL_HOST_USER, "
                        "EMAIL_HOST_PASSWORD e as configurações SMTP."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({"detail": "E-mail de teste enviado com sucesso."})
