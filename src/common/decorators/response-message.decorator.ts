import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE_KEY = 'response_message';

/**
 * Sets the `message` of the wrapped response. The value is an i18n key, so the
 * client gets it in the language it asked for.
 *
 * @example
 * ＠ResponseMessage('messages.created')
 */
export const ResponseMessage = (messageKey: string) =>
  SetMetadata(RESPONSE_MESSAGE_KEY, messageKey);
