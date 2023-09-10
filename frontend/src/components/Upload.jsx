import {
  Button,
  Box,
  Text,
  VStack,
  HStack,
  Image,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";

const Upload = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [fullRecognizedText, setFullRecognizedText] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [points, setPoints] = useState(() => {
    const savedPoints = localStorage.getItem("points");
    return savedPoints ? JSON.parse(savedPoints) : 0;
  });

  useEffect(() => {
    localStorage.setItem("points", JSON.stringify(points));
  }, [points]);

  const imageBoxStyles = {
    width: "150px", // Increased size
    height: "150px",
    bgSize: "cover",
    bgPosition: "center",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // subtle shadow
    border: "1px solid #E2E8F0", // light border
    transition: "transform 0.3s", // for hover effect
    "&:hover": {
      transform: "scale(1.05)", // zoom-in effect on hover
    },
  };

  const toast = useToast();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setUploadedImages((prevImages) => [...prevImages, reader.result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractTotalPrice = (text) => {
    // This pattern now looks for both "subtotal" and "sub-total"
    const pattern = /sub(-)?total[^0-9]*?(\d+\.\d{2})/i;
    const match = text.match(pattern);
    return match ? parseFloat(match[2]) : null;
  };

  const [recognizedTexts, setRecognizedTexts] = useState(() => {
    const savedTexts = localStorage.getItem("recognizedTexts");
    return savedTexts ? JSON.parse(savedTexts) : [];
  });

  const handleUpload = async () => {
    if (selectedImage) {
      try {
        const result = await Tesseract.recognize(selectedImage, "eng");

        // Check if the text has been recognized before
        if (recognizedTexts.includes(result.data.text)) {
          toast({
            title: "Duplicate Receipt",
            description: "This receipt has already been recognized.",
            status: "warning",
            duration: 2000,
            isClosable: true,
          });
          return;
        }

        setFullRecognizedText(result.data.text);
        setRecognizedTexts((prevTexts) => [...prevTexts, result.data.text]);

        const newTotalPrice = extractTotalPrice(result.data.text);
        if (newTotalPrice !== null) {
          setTotalPrice((prevPrice) => prevPrice + newTotalPrice);
          setPoints((prevPoints) => prevPoints + Math.floor(newTotalPrice));
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Error recognizing text from the image.",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    }
  };

  useEffect(() => {
    localStorage.setItem("recognizedTexts", JSON.stringify(recognizedTexts));
  }, [recognizedTexts]);

  return (
    <VStack spacing={4} mt={8}>
      <Box mt={4}>
        <Text fontWeight="bold">Total Points Earned:</Text>
        <Text>{points}</Text>
      </Box>
      <HStack spacing={4} mt={8} overflowX="auto">
        {uploadedImages.map((imageSrc, idx) => (
          <Box
            key={idx}
            width="100px"
            height="100px"
            bgSize="cover"
            bgPosition="center"
          >
            <Image src={imageSrc} boxSize="100px" alt="Uploaded preview" />
          </Box>
        ))}
      </HStack>
      <Box>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          hidden
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button as="span">Choose an image</Button>
        </label>
      </Box>
      <Button onClick={handleUpload} colorScheme="blue">
        Recognize Text
      </Button>

      {/* Gallery of uploaded images */}
    </VStack>
  );
};

export default Upload;
