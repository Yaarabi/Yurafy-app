
import { redirect } from 'next/navigation';

export default function RootPage() {
  // redirect to default locale
  redirect('/en');
}
