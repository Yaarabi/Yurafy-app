import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}: {requestLocale: Promise<string | undefined>}) => {
  const requested = await requestLocale;
  
  // Use requested locale if valid, otherwise default
  const locale = requested && hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale
  };
});