<?php

namespace App\Filament\Resources\Articles\Tables;

use App\Enums\ArticleStatus;
use App\Models\Article;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ForceDeleteBulkAction;
use Filament\Actions\RestoreBulkAction;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Filters\TrashedFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ArticlesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('cover_image')
                    ->label('Capa')
                    ->disk('public')
                    ->height(48)
                    ->square(),
                TextColumn::make('title')
                    ->label('Título')
                    ->description(fn (Article $record): string => $record->slug)
                    ->searchable(['title', 'slug', 'excerpt'])
                    ->sortable()
                    ->grow()
                    ->wrap(),
                TextColumn::make('category')
                    ->label('Categoria')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('author.name')
                    ->label('Autor')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->formatStateUsing(fn (ArticleStatus $state): string => $state->getLabel())
                    ->color(fn (ArticleStatus $state): string => $state->getColor())
                    ->sortable(),
                TextColumn::make('published_at')
                    ->label('Publicação')
                    ->dateTime('d/m/Y H:i')
                    ->description(fn (Article $record): ?string => $record->isScheduled() ? 'Agendado' : null)
                    ->placeholder('—')
                    ->sortable(),
                IconColumn::make('is_featured')
                    ->label('Destaque')
                    ->boolean()
                    ->sortable(),
                TextColumn::make('updated_at')
                    ->label('Atualizado em')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->label('Status')
                    ->options(ArticleStatus::options()),
                SelectFilter::make('category')
                    ->label('Categoria')
                    ->options(fn (): array => Article::query()
                        ->whereNotNull('category')
                        ->distinct()
                        ->orderBy('category')
                        ->pluck('category', 'category')
                        ->all()),
                TernaryFilter::make('is_featured')
                    ->label('Destaque')
                    ->boolean()
                    ->trueLabel('Somente destaques')
                    ->falseLabel('Sem destaque')
                    ->native(false),
                Filter::make('scheduled')
                    ->label('Publicação agendada')
                    ->query(fn (Builder $query): Builder => $query->scheduled()),
                TrashedFilter::make(),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                    ForceDeleteBulkAction::make(),
                    RestoreBulkAction::make(),
                ]),
            ])
            ->defaultSort('updated_at', 'desc')
            ->searchPlaceholder('Buscar artigos')
            ->persistSearchInSession()
            ->persistFiltersInSession()
            ->striped()
            ->stackedOnMobile()
            ->emptyStateIcon(Heroicon::OutlinedDocumentText)
            ->emptyStateHeading('Nenhum artigo cadastrado')
            ->emptyStateDescription('Crie o primeiro artigo para começar a organizar o conteúdo.')
            ->emptyStateActions([
                CreateAction::make()
                    ->label('Novo artigo')
                    ->icon(Heroicon::OutlinedPlus),
            ]);
    }
}
