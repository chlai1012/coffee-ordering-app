import test from 'node:test';
import assert from 'node:assert/strict';

import { getOptionGroupInputName } from './optionGroupName.ts';

test('option group names stay unique per menu item and group', () => {
  const firstCardName = getOptionGroupInputName(1, 5);
  const secondCardDifferentItemSameGroup = getOptionGroupInputName(2, 5);
  const sameCardSameGroup = getOptionGroupInputName(1, 5);

  assert.notEqual(firstCardName, secondCardDifferentItemSameGroup);
  assert.equal(firstCardName, sameCardSameGroup);
  assert.match(firstCardName, /^option-group-1-5$/);
});
