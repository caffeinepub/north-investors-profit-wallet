// Stub type declaration for qrcode package used in QR rendering components
declare module "qrcode" {
  interface QRCodeOptions {
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  }

  interface QRCodeStatic {
    toCanvas(
      canvas: HTMLCanvasElement,
      text: string,
      options?: QRCodeOptions,
    ): Promise<void>;
    toDataURL(text: string, options?: QRCodeOptions): Promise<string>;
  }

  const qrcode: QRCodeStatic;
  export default qrcode;
}
