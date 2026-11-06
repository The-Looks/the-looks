import type { InputHTMLAttributes } from 'react';
import { Field } from '../../shared/ui/index';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onCopy' | 'onCut' | 'onDragStart'> & {
  id: string;
  label: string;
};

/** Prevent copying the entered password while keeping paste and password managers available. */
export function PasswordField({ id, label, ...props }: Props) {
  return <Field id={id} label={label} type="password" {...props}
    onCopy={(event) => event.preventDefault()}
    onCut={(event) => event.preventDefault()}
    onDragStart={(event) => event.preventDefault()}
  />;
}
