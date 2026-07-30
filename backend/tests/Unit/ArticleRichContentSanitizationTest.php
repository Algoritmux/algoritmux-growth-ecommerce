<?php

namespace Tests\Unit;

use Illuminate\Support\Str;
use Tests\TestCase;

class ArticleRichContentSanitizationTest extends TestCase
{
    public function test_sanitizer_preserves_safe_internal_image_markup(): void
    {
        $html = Str::sanitizeHtml(
            '<figure class="article-figure"><img src="/storage/articles/content/image.webp" alt="Descrição" width="960" height="540"><figcaption>Legenda segura</figcaption></figure>',
        );

        $this->assertStringContainsString('<figure class="article-figure">', $html);
        $this->assertStringContainsString('<figcaption>Legenda segura</figcaption>', $html);
        $this->assertStringContainsString('src="/storage/articles/content/image.webp"', $html);
        $this->assertStringContainsString('alt="Descrição"', $html);
        $this->assertStringContainsString('width="960"', $html);
        $this->assertStringContainsString('height="540"', $html);
    }

    public function test_sanitizer_removes_executable_image_attributes_and_protocols(): void
    {
        $html = Str::sanitizeHtml(
            '<img src="javascript:alert(1)" alt="Imagem" onerror="alert(1)">',
        );

        $this->assertStringNotContainsString('javascript:', $html);
        $this->assertStringNotContainsString('onerror', $html);
        $this->assertStringContainsString('alt="Imagem"', $html);
    }

    public function test_sanitizer_preserves_semantic_lists_and_nested_items(): void
    {
        $html = Str::sanitizeHtml(
            '<ul><li>Item<ul><li>Subitem</li></ul></li></ul><ol start="2"><li>Passo</li></ol>',
        );

        $this->assertStringContainsString('<ul>', $html);
        $this->assertStringContainsString('<li>Item', $html);
        $this->assertStringContainsString('<li>Subitem</li>', $html);
        $this->assertStringContainsString('<ol start="2">', $html);
        $this->assertStringContainsString('<li>Passo</li>', $html);
    }
}
