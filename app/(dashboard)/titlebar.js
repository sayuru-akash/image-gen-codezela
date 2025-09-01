import Image from "next/image";
import { useRouter } from "next/navigation";
import { Fab, Tooltip } from "@mui/material";
import { Home as HomeIcon } from "@mui/icons-material";

export default function TitleBar() {
  const router = useRouter();

  const navigateHome = () => {
    router.push("/");
  };

  return (
    <div className="flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gradient-to-r from-white from-20% to-gold to-80% rounded-full mr-2"></div>
        <span className="text-xl font-semibold tracking-wider text-white">
          kAIro
        </span>
      </div>

      {/* Right side with Home button and Profile */}
      <div className="flex items-center gap-3">
        {/* Home Button */}
        <Tooltip title="Go to Home" placement="bottom">
          <Fab
            size="small"
            onClick={navigateHome}
            sx={{
              bgcolor: "#D4AF3700",
              border: "1px solid #D4AF37",
              color: "#D4AF37",
              "&:hover": {
                bgcolor: "#D4AF3720",
                borderColor: "#D4AF37",
                transform: "scale(1.05)",
              },
              backdropFilter: "blur(4px)",
              transition: "all 0.3s ease",
            }}
          >
            <HomeIcon fontSize="small" />
          </Fab>
        </Tooltip>

        {/* Profile Icon */}
        <div className="w-14 h-14 bg-gradient-to-r from-white from-20% to-gold to-80% rounded-full overflow-hidden">
          <Image
            src="/images/john-doe.svg"
            alt="Profile"
            width={100}
            height={100}
            className="w-14 h-14"
          />
        </div>
      </div>
    </div>
  );
}
