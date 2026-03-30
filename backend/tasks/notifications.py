import logging
from html import escape

from django.conf import settings
from django.core.mail import EmailMultiAlternatives

logger = logging.getLogger(__name__)


def _is_email_configured() -> bool:
    return bool(settings.EMAIL_HOST_USER and settings.EMAIL_HOST_PASSWORD)


def _build_email_shell(title: str, intro: str, body: str, cta_label: str) -> str:
    dashboard_url = f"{settings.FRONTEND_URL.rstrip('/')}/dashboard"
    return f"""
    <div style="margin:0;padding:32px 16px;background:#f4f7fb;font-family:Arial,sans-serif;color:#16324f;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dbe5ef;border-radius:18px;overflow:hidden;">
        <div style="padding:28px 32px;background:#014e83;color:#ffffff;">
          <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.78;">To Do List</p>
          <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2;">{title}</h1>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#35516b;">{intro}</p>
          <div style="padding:20px;border:1px solid #e4ecf3;border-radius:14px;background:#f9fbfd;">
            {body}
          </div>
          <div style="margin-top:28px;">
            <a href="{dashboard_url}" style="display:inline-block;background:#ee7810;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;">
              {cta_label}
            </a>
          </div>
        </div>
      </div>
    </div>
    """


def _send_email(to_email: str, subject: str, html: str) -> bool:
    if not _is_email_configured() or not to_email:
        logger.warning(
            "SMTP email is not configured or recipient email is missing. from=%s to=%s",
            settings.DEFAULT_FROM_EMAIL,
            to_email,
        )
        return False

    try:
        message = EmailMultiAlternatives(
            subject=subject,
            body="Seu cliente de e-mail nao oferece suporte para mensagens HTML.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email],
            reply_to=[settings.EMAIL_REPLY_TO] if settings.EMAIL_REPLY_TO else None,
        )
        message.attach_alternative(html, "text/html")
        message.send(fail_silently=False)
        logger.info("SMTP email sent successfully to %s", to_email)
        return True
    except Exception as exc:
        logger.warning("Failed to send SMTP email: %s", exc)
    return False


def send_task_shared_email(*, task, sender, recipient, permission: str) -> bool:
    if (
        not recipient.notifications_enabled
        or not recipient.notify_on_task_shared
        or not recipient.email
    ):
        return False

    permission_label = "edicao" if permission == "edit" else "visualizacao"
    subject = f"Tarefa compartilhada com voce: {task.title}"
    intro = (
        f"{escape(sender.username)} compartilhou uma tarefa com voce com permissao de {permission_label}."
    )
    body = f"""
      <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#16324f;">{escape(task.title)}</p>
      <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#4b647c;">{escape(task.description or 'Sem descricao informada.')}</p>
      <p style="margin:0;font-size:13px;color:#6b7f92;">Compartilhada por @{escape(sender.username)}</p>
    """
    return _send_email(
        recipient.email,
        subject,
        _build_email_shell(subject, intro, body, "Abrir painel"),
    )


def send_task_completed_email(*, task, actor, recipient) -> bool:
    if (
        not recipient.notifications_enabled
        or not recipient.notify_on_task_completed
        or not recipient.email
    ):
        return False

    subject = f"Tarefa concluida: {task.title}"
    intro = f"@{escape(actor.username)} marcou uma tarefa compartilhada como concluida."
    body = f"""
      <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#16324f;">{escape(task.title)}</p>
      <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#4b647c;">{escape(task.description or 'Sem descricao informada.')}</p>
      <p style="margin:0;font-size:13px;color:#6b7f92;">Concluida por @{escape(actor.username)}</p>
    """
    return _send_email(
        recipient.email,
        subject,
        _build_email_shell(subject, intro, body, "Revisar tarefa"),
    )


def send_test_email(*, recipient) -> bool:
    if not recipient.email:
        return False

    subject = "Notificacoes do To Do List prontas"
    intro = "Este e um e-mail de teste das configuracoes de notificacao do To Do List."
    body = """
      <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#16324f;">Notificacoes ativas</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#4b647c;">
        Se voce recebeu este e-mail, a integracao SMTP esta configurada e o aplicativo pode entregar notificacoes corretamente.
      </p>
    """
    return _send_email(
        recipient.email,
        subject,
        _build_email_shell(subject, intro, body, "Abrir perfil"),
    )
