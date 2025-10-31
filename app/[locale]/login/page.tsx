
import LoginForm from '@/components/login/loginForm';
import BrandHeader from '@/components/login/brandHeader';
import Footer from '@/components/login/footer';

export default function LoginPage() {

    return (
        <div className="max-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col justify-center items-center px-4">
        <BrandHeader  />
        <LoginForm  />
        <Footer  />
        </div>
    );
}
