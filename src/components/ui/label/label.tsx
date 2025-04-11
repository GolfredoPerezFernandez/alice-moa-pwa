import { component$, Slot, type PropsOf } from '@builder.io/qwik';
import { cn } from '../utils';

export type LabelProps = PropsOf<'label'>;

export const Label = component$<LabelProps>(({ ...props }) => {
  return (
    <label
      {...props}
      class={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        props.class
      )}
    >
      <Slot />
    </label>
  );
});