import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The signature Margin mark: a rounded yellow tile carrying the bold "M".
 * Used for compact contexts (favicon, apple icon, admin sidebar, CMS header).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("size-8 shrink-0", className)}
    >
      <rect width="32" height="32" rx="7" fill="#FFDB61" />
      <g fill="#111111" transform="translate(5.527, 25.000) scale(0.012278, -0.012278)">
        <path d="M145 0V1466H588L854 466L1117 1466H1561V0H1286V1154L995 0H710L420 1154V0Z" />
      </g>
    </svg>
  );
}

/**
 * The official "The [Margin] Co" wordmark:
 * Clean, bold typography with the signature warm-yellow badge highlight on "Margin".
 * Exactly reproduces the brand logo with pixel precision and vector scalability.
 */
export function LogoWordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 945 158"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("h-7 w-auto shrink-0 transition-opacity duration-200 sm:h-8", className)}
    >
      {/* Yellow badge behind Margin */}
      <rect x="259" y="0" width="501" height="158" rx="9" ry="9" fill="#FFDB61" />

      {/* The */}
      <g fill="currentColor">
        <g transform="translate(0, 116.0) scale(0.066985, -0.066985)">
          <path d="M479 0V1218H44V1466H1209V1218H775V0Z" />
          <path d="M427 1466V927Q563 1086 752 1086Q849 1086 927.0 1050.0Q1005 1014 1044.5 958.0Q1084 902 1098.5 834.0Q1113 766 1113 623V0H832V561Q832 728 816.0 773.0Q800 818 759.5 844.5Q719 871 658 871Q588 871 533.0 837.0Q478 803 452.5 734.5Q427 666 427 532V0H146V1466Z" transform="translate(1251, 0)" />
          <path d="M762 338 1042 291Q988 137 871.5 56.5Q755 -24 580 -24Q303 -24 170 157Q65 302 65 523Q65 787 203.0 936.5Q341 1086 552 1086Q789 1086 926.0 929.5Q1063 773 1057 450H353Q356 325 421.0 255.5Q486 186 583 186Q649 186 694.0 222.0Q739 258 762 338ZM778 622Q775 744 715.0 807.5Q655 871 569 871Q477 871 417 804Q357 737 358 622Z" transform="translate(2502, 0)" />
        </g>
      </g>

      {/* Margin (dark on yellow badge) */}
      <g fill="#111111">
        <g transform="translate(289, 116.0) scale(0.066985, -0.066985)">
          <path d="M145 0V1466H588L854 466L1117 1466H1561V0H1286V1154L995 0H710L420 1154V0Z" />
          <path d="M357 738 102 784Q145 938 250.0 1012.0Q355 1086 562 1086Q750 1086 842.0 1041.5Q934 997 971.5 928.5Q1009 860 1009 677L1006 349Q1006 209 1019.5 142.5Q1033 76 1070 0H792Q781 28 765 83Q758 108 755 116Q683 46 601.0 11.0Q519 -24 426 -24Q262 -24 167.5 65.0Q73 154 73 290Q73 380 116.0 450.5Q159 521 236.5 558.5Q314 596 460 624Q657 661 733 693V721Q733 802 693.0 836.5Q653 871 542 871Q467 871 425.0 841.5Q383 812 357 738ZM733 510Q679 492 562.0 467.0Q445 442 409 418Q354 379 354 319Q354 260 398.0 217.0Q442 174 510 174Q586 174 655 224Q706 262 722 317Q733 353 733 454Z" transform="translate(1706, 0)" />
          <path d="M416 0H135V1062H396V911Q463 1018 516.5 1052.0Q570 1086 638 1086Q734 1086 823 1033L736 788Q665 834 604 834Q545 834 504.0 801.5Q463 769 439.5 684.0Q416 599 416 328Z" transform="translate(2845, 0)" />
          <path d="M121 -70 442 -109Q450 -165 479 -186Q519 -216 605 -216Q715 -216 770 -183Q807 -161 826 -112Q839 -77 839 17V172Q713 0 521 0Q307 0 182 181Q84 324 84 537Q84 804 212.5 945.0Q341 1086 532 1086Q729 1086 857 913V1062H1120V109Q1120 -79 1089.0 -172.0Q1058 -265 1002.0 -318.0Q946 -371 852.5 -401.0Q759 -431 616 -431Q346 -431 233.0 -338.5Q120 -246 120 -104Q120 -90 121 -70ZM372 553Q372 384 437.5 305.5Q503 227 599 227Q702 227 773.0 307.5Q844 388 844 546Q844 711 776.0 791.0Q708 871 604 871Q503 871 437.5 792.5Q372 714 372 553Z" transform="translate(3642, 0)" />
          <path d="M147 1206V1466H428V1206ZM147 0V1062H428V0Z" transform="translate(4893, 0)" />
          <path d="M1113 0H832V542Q832 714 814.0 764.5Q796 815 755.5 843.0Q715 871 658 871Q585 871 527.0 831.0Q469 791 447.5 725.0Q426 659 426 481V0H145V1062H406V906Q545 1086 756 1086Q849 1086 926.0 1052.5Q1003 1019 1042.5 967.0Q1082 915 1097.5 849.0Q1113 783 1113 660Z" transform="translate(5462, 0)" />
        </g>
      </g>

      {/* Co */}
      <g fill="currentColor">
        <g transform="translate(776, 116.0) scale(0.066985, -0.066985)">
          <path d="M1087 539 1374 448Q1308 208 1154.5 91.5Q1001 -25 765 -25Q473 -25 285.0 174.5Q97 374 97 720Q97 1086 286.0 1288.5Q475 1491 783 1491Q1052 1491 1220 1332Q1320 1238 1370 1062L1077 992Q1051 1106 968.5 1172.0Q886 1238 768 1238Q605 1238 503.5 1121.0Q402 1004 402 742Q402 464 502.0 346.0Q602 228 762 228Q880 228 965.0 303.0Q1050 378 1087 539Z" />
          <path d="M82 546Q82 686 151.0 817.0Q220 948 346.5 1017.0Q473 1086 629 1086Q870 1086 1024.0 929.5Q1178 773 1178 534Q1178 293 1022.5 134.5Q867 -24 631 -24Q485 -24 352.5 42.0Q220 108 151.0 235.5Q82 363 82 546ZM370 531Q370 373 445.0 289.0Q520 205 630 205Q740 205 814.5 289.0Q889 373 889 533Q889 689 814.5 773.0Q740 857 630 857Q520 857 445.0 773.0Q370 689 370 531Z" transform="translate(1479, 0)" />
        </g>
      </g>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className,
      )}
      aria-label="The Margin Co home"
    >
      <LogoWordmark className="group-hover:opacity-85" />
    </Link>
  );
}
