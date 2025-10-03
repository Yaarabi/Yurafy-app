
import LoginForm from '@/components/login/loginForm';
import BrandHeader from '@/components/login/brandHeader';
import Footer from '@/components/login/footer';

export default function LoginPage() {

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-800 via-blue-700 to-cyan-600 flex flex-col justify-center items-center px-4">
        <BrandHeader  />
        <LoginForm  />
        <Footer  />
        </div>
    );
}
