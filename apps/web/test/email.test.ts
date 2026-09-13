import { expect, it } from 'vitest';
import { emailError, initialDraft, validate } from '../src/model/form';

it.each(['buyer@example.test', 'First.Last+shop@sub.example.com', "o'connor@example.org"])(
  'accepts a valid email: %s',
  (email) => expect(emailError(email)).toBeUndefined(),
);

it.each([
  '',
  ' ',
  'buyer',
  'buyer@',
  '@example.test',
  'buyer@example',
  'buyer@.com',
  'buyer..name@example.test',
  '.buyer@example.test',
  'buyer.@example.test',
  'buyer@-example.test',
  'buyer@example-.test',
  'buyer@exam_ple.test',
  'buyer name@example.test',
  'buyer@@example.test',
  `${'a'.repeat(140)}@example.test`,
])('rejects an invalid email on both field validation and submit: %s', (email) => {
  const error = emailError(email);

  expect(error).toBeDefined();
  expect(validate({ ...initialDraft, customer: { ...initialDraft.customer, email } }).email).toBe(
    error,
  );
});
