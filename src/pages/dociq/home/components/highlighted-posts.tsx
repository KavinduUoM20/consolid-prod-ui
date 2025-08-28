import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface HighlightedPostsItems {
  icon: LucideIcon;
  title: string;
  summary: string;
  path: string;
}

interface HighlightedPostsProps {
  posts: HighlightedPostsItems[];
}

const HighlightedPosts = ({ posts }: HighlightedPostsProps) => {
  return (
    <Card>
      <CardContent className="p-5 lg:p-7.5">
        <div className="flex flex-col gap-3.5">
          <h3 className="text-lg font-semibold text-mono">Security Resources</h3>
          <div className="flex flex-col gap-3.5">
            {posts.map((post, index) => (
              <div key={index} className="flex flex-col gap-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 mt-1">
                    <post.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-medium text-mono leading-tight">
                      {post.title}
                    </h4>
                    <p className="text-xs text-gray700 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <Button variant="outline" size="sm" asChild>
                    <a href={post.path}>Learn More</a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { HighlightedPosts, type HighlightedPostsItems }; 