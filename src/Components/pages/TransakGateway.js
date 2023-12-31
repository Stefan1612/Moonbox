import React, { useState } from "react";
import transakSDK from "@transak/transak-sdk";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
/* import axios from "axios"; */
import { Box, Button, Typography, Container } from "@mui/material";
const Transak = () => {
  const [transakSucceed, setTransakSucceed] = useState(false);
  let transak = new transakSDK({
    apiKey: process.env.REACT_APP_API_KEY_TRANSAK, // Your API Key
    environment: "STAGING", // STAGING/PRODUCTION
    hostURL: window.location.origin,
    widgetHeight: "625px",
    widgetWidth: "500px",
    // Examples of some of the customization parameters you can pass
    defaultCryptoCurrency: "ETH", // Example 'ETH'
    walletAddress: "", // Your customer's wallet address
    themeColor: "#0000ff", // App theme color
    fiatCurrency: "", // If you want to limit fiat selection eg 'USD'
    email: "", // Your customer's email address
    redirectURL: "",
  });

  function startTransak() {
    transak.init();
  }

  // To get all the events
  transak.on(transak.ALL_EVENTS, (data) => {
    console.log(data);
  });

  // This will trigger when the user marks payment is made.
  transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData) => {
    console.log(orderData);
    transak.close();
    setTransakSucceed(true);
  });

  return (
    <Box
      id="background"
      sx={{ backgroundColor: "#212121", minHeight: "100vh" }}
      allow="payment"
    >
      <Box
        sx={{
          color: "white",
          paddingLeft: "5px",
        }}
      >
        <ArrowUpwardIcon sx={{ fontSize: 60 }} />
        Check our Services!
      </Box>
      <Container allow="payment">
        <Box
          style={{
            textAlign: "center",
          }}
        >
          <Box marginTop={"5vh"}>
            <Typography component={"h1"} variant={"h2"} sx={{ color: "white" }}>
              {/* Want to buy your favourite Crypto Currency? */} Currently in
              process! (Easy One click solution for buying your favourite
              Cryptocurrencies in one click)
            </Typography>
          </Box>{" "}
          {/*    <Box>
            <Typography component={"p"} variant={"h5"} sx={{ color: "white" }}>
              You can easily buy yourself some crypto with One Click using
              Transak.
            </Typography>
          </Box>
          <Button
            allow="payment"
            style={{
              backgroundColor: "rgb(106, 160, 182)",
              border: "1px solid",
              textAlign: "center",
              marginTop: "5vh",
              width: "25vw",
              height: "10vh",
            }}
            variant="contained"
            onClick={(e) => startTransak()}
          >
            Open transak
          </Button>
          {transakSucceed && <Box>Succeed</Box>} */}
        </Box>
      </Container>
    </Box>
  );
};

export default Transak;
