@if ($imageUrl)
<p style="margin: 0 0 24px;">
    <img src="{{ $imageUrl }}" alt="" style="display: block; width: 100%; max-width: 640px; height: auto; border: 0;" />
</p>
@endif
<h1 style="margin: 0 0 16px;">{{ $title }}</h1>
<p style="margin: 0 0 24px;">{{ $summary }}</p>
<p style="margin: 0;">
    <a href="{{ $link }}" style="display: inline-block; padding: 12px 20px; border-radius: 6px; background: #6c4cff; color: #ffffff; text-decoration: none;">
        Ler artigo completo
    </a>
</p>
