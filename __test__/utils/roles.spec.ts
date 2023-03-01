// @flow
import {hasClaim} from '../../utils/roles';

describe('Utils: Roles', () => {
    describe('hasClaim', () => {
        test('returns false if role is not recognised', async () => {
            const userHasClaim = hasClaim('something', 'projects:list');

            expect(userHasClaim).toEqual(false);
        });

        test('returns false if role is not allowed to perform the action', async () => {
            const userHasClaim = hasClaim('enumerator', 'users:get');

            expect(userHasClaim).toEqual(false);
        });

        test('returns false if role is allowed to perform the action but fails validation', async () => {
            const userHasClaim = hasClaim('enumerator', 'users:update', {userId: 1, authUserId: 2});

            expect(userHasClaim).toEqual(false);
        });

        test('returns true if role is allowed to perform the', async () => {
            const userHasClaim = hasClaim('administrator', 'users:get');

            expect(userHasClaim).toEqual(true);
        });

        test('returns true if role is allowed to perform the action and passes validation', async () => {
            const userHasClaim = hasClaim('enumerator', 'users:update', {userId: 1, authUserId: 1});

            expect(userHasClaim).toEqual(true);
        });
    });
});
