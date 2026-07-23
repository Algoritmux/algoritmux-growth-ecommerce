import type { ArticleContentBlock } from '../../types/content';

export function ArticleContent({ blocks }: { blocks: ArticleContentBlock[] }) {
  return (
    <div className="article-content">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return <h2 key={`${block.type}-${index}`}>{block.text}</h2>;
        }
        if (block.type === 'quote') {
          return <blockquote key={`${block.type}-${index}`}>{block.text}</blockquote>;
        }
        return <p key={`${block.type}-${index}`}>{block.text}</p>;
      })}
    </div>
  );
}
