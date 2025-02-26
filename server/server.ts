on("onResourceStart", (resName: string) => {
  if (resName === GetCurrentResourceName()) {
    console.log("Resource started: " + resName);
  }
});
