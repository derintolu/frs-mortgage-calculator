import { Tabs as BaseTabs, TabsList as BaseTabsList, TabsTrigger as BaseTabsTrigger, TabsContent } from '../../components/ui/tabs';
import { ComponentProps } from 'react';

interface BrandedTabsProps extends ComponentProps<typeof BaseTabs> {
  gradientStart?: string;
  gradientEnd?: string;
}

interface BrandedTabsListProps extends ComponentProps<typeof BaseTabsList> {
  gradientStart?: string;
  gradientEnd?: string;
}

interface BrandedTabsTriggerProps extends ComponentProps<typeof BaseTabsTrigger> {
  gradientStart?: string;
  gradientEnd?: string;
}

export function Tabs({ gradientStart = '#2563eb', gradientEnd = '#2dd4da', ...props }: BrandedTabsProps) {
  return (
    <div
      style={{
        '--brand-primary-blue': gradientStart,
        '--brand-rich-teal': gradientEnd,
      } as React.CSSProperties}
    >
      <BaseTabs {...props} />
    </div>
  );
}

export function TabsList(props: BrandedTabsListProps) {
  return <BaseTabsList {...props} />;
}

export function TabsTrigger(props: BrandedTabsTriggerProps) {
  return <BaseTabsTrigger {...props} />;
}

export { TabsContent };
