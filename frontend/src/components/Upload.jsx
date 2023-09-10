import { Button, Box, Text, VStack, useToast } from "@chakra-ui/react";
import { useState } from "react";
import Tesseract from "tesseract.js";

const Upload = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [fullRecognizedText, setFullRecognizedText] = useState("");
  const [numbersWithTwoDecimals, setNumbersWithTwoDecimals] = useState([]);

  const toast = useToast();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractTotalPrice = (text) => {
    const pattern = /subtotal[^0-9]*?(\d+\.\d{2})/i; // This will capture any number of non-digit characters between "total" and the actual price.
    const match = text.match(pattern);
    return match ? match[1] : null;
  };

  const [recognizedTexts, setRecognizedTexts] = useState(() => {
    const savedTexts = localStorage.getItem("recognizedTexts");
    return savedTexts ? JSON.parse(savedTexts) : [];
  });

  const handleUpload = async () => {
    if (selectedImage) {
      // Recognize text from the image using Tesseract.js
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
      {selectedImage && (
        <Box>
          <img
            src={selectedImage}
            alt="Chosen"
            style={{ height: "150px", width: "150px" }}
          />
        </Box>
      )}
      <Button onClick={handleUpload} colorScheme="blue">
        Recognize Text
      </Button>

      {/* Gallery of uploaded images */}
    </VStack>
  );
};

export default Upload;
