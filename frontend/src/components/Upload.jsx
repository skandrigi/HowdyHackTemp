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

  const handleUpload = async () => {
    if (selectedImage) {
      // Recognize text from the image using Tesseract.js
      try {
        const result = await Tesseract.recognize(selectedImage, "eng", {
          logger: (m) => console.log(m),
        });

        setFullRecognizedText(result.data.text);

        const totalPrice = extractTotalPrice(result.data.text);
        if (totalPrice !== null) {
          setNumbersWithTwoDecimals([totalPrice]);
        } else {
          setNumbersWithTwoDecimals([]);
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

  return (
    <VStack spacing={4} mt={8}>
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
      {fullRecognizedText && (
        <Box mt={4}>
          <Text fontWeight="bold">Recognized Text:</Text>
          <Text>{fullRecognizedText}</Text>
        </Box>
      )}

      {numbersWithTwoDecimals.length > 0 && (
        <Box mt={4}>
          <Text fontWeight="bold">Total Price:</Text>
          <Text>${numbersWithTwoDecimals[0]}</Text>
        </Box>
      )}
    </VStack>
  );
};

export default Upload;
