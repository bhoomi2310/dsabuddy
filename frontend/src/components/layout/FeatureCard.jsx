import { Card, IconBox, Badge } from "@/components/common";

export const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  variant = "primary",
  iconVariant = "primary",
  delay = 0 
}) => {
  return (
    <Card variant="default" delay={delay}>
      <IconBox icon={Icon} variant={iconVariant} />
      <div>
        <h3 className="font-bold mt-4 text-lg font-Spline-Sans">{title}</h3>
        <p className="content-color mt-2">{description}</p>
      </div>
    </Card>
  );
};
