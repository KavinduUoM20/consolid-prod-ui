import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface IFeaturesHighlightProps {
  image: ReactNode;
  title: ReactNode;
  description: string;
  more: {
    title: string;
    url: string;
  };
  features: string[][];
}

const FeaturesHighlight = ({
  image,
  title,
  description,
  more,
  features,
}: IFeaturesHighlightProps) => {
  return (
    <Card>
      <CardContent className="p-5 lg:p-7.5">
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-7.5">
          <div className="flex-shrink-0">{image}</div>
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-2.5">
              <h3 className="text-xl font-semibold text-mono">{title}</h3>
              <p className="text-sm text-gray700">{description}</p>
            </div>
            <div className="flex flex-col gap-2.5">
              {features.map((featureGroup, index) => (
                <div key={index} className="flex flex-wrap gap-2.5">
                  {featureGroup.map((feature, featureIndex) => (
                    <span
                      key={featureIndex}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex justify-start">
              <Button variant="outline" size="sm" asChild>
                <a href={more.url}>{more.title}</a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { FeaturesHighlight, type IFeaturesHighlightProps }; 