import { Button } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useColorMode } from "@chakra-ui/react";
// import BiSolidDog from "react-icons/bi";
import { BiSolidDog } from "react-icons/bi";

const DarkModeSwitch = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Button onClick={toggleColorMode} variant="ghost" color="white">
      {colorMode === "light" ? <MoonIcon /> : <BiSolidDog />}
    </Button>
  );
};

export default DarkModeSwitch;
