
'use client';
import { FireSphere } from '@/components/ui/fire-sphere';

interface BurnAnimationProps {
    bgImageUri: string;
    isLightMode: boolean;
}

const BurnAnimation: React.FC<BurnAnimationProps> = ({ bgImageUri, isLightMode }) => {
    return (
        <div className="fixed top-0 left-0 w-full h-full z-[1000]">
            {/* Background image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${bgImageUri})` }}
            />
            {/* Fire overlay */}
            <FireSphere
                className="w-full h-full mix-blend-screen"
                isLightMode={isLightMode}
            />
        </div>
    );
};

export default BurnAnimation;
