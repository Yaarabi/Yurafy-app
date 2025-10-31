

// import BrandHeader from '@/components/login/brandHeader';
import Footer from '@/components/login/footer';
import SignupForm from '@/components/login/signUpForm';

export default function LoginPage() {

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col justify-center items-center px-4">
        {/* <BrandHeader  /> */}
        <SignupForm  />
        <Footer  />
        </div>
    );
}
