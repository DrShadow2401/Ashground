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
            
            {/* Darkening overlay that intensifies the fire visuals */}
            <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />

            {/* The new intense spreading fire animation - rendered directly for clarity */}
            <div className="absolute inset-0">
                <CellularFire />
            </div>
        </div>
    );
};

export default BurnAnimation;
