<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $magnet['subject'] }}</title>
</head>
<body style="margin:0;background:#07051a;color:#e5e7eb;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#07051a;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#111827;border:1px solid #243047;border-radius:18px;overflow:hidden;">
                    <tr>
                        <td style="padding:34px;">
                            <p style="margin:0 0 12px;color:#67e8f9;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">Algoritmux · E-book gratuito</p>
                            <h1 style="margin:0 0 18px;color:#ffffff;font-size:28px;line-height:1.2;">{{ $magnet['title'] }}</h1>
                            <p style="margin:0 0 14px;color:#cbd5e1;font-size:16px;line-height:1.65;">Olá, {{ $lead->name }}.</p>
                            <p style="margin:0 0 26px;color:#cbd5e1;font-size:16px;line-height:1.65;">Seu material está pronto. Use o botão abaixo para baixar o PDF. O link é pessoal e ficará disponível por 7 dias.</p>
                            <a href="{{ $downloadUrl }}" style="display:inline-block;padding:15px 24px;border-radius:10px;background:#22d3ee;color:#07111c;font-size:16px;font-weight:700;text-decoration:none;">Baixar e-book</a>
                            <p style="margin:28px 0 0;color:#94a3b8;font-size:13px;line-height:1.55;">Se o botão não funcionar, copie e cole este endereço no navegador:<br><a href="{{ $downloadUrl }}" style="color:#67e8f9;word-break:break-all;">{{ $downloadUrl }}</a></p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
