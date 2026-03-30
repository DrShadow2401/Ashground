'use client';
import { CellularFire } from '@/components/ui/cellular-fire';

interface BurnAnimationProps {
    bgImageUri: string;
    isLightMode: boolean;
}

const BurnAnimation: React.FC<BurnAnimationProps> = ({ bgImageUri, isLightMode }) => {
    return (
        <div className="fixed inset-0 z-[1000] overflow-hidden pointer-events-none">
            {/* Background captured image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${bgImageUri})` }}
            />
            {/* The new intense spreading fire animation */}
            <div className="absolute inset-0 mix-blend-screen">
                <CellularFire />
            </div>
            {/* Darkening overlay that intensifies as fire spreads */}
            <div className="absolute inset-0 bg-black/30 mix-blend-multiply pointer-events-none" />
        </div>
    );
};

export default BurnAnimation;
