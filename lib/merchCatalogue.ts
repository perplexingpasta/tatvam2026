import { MerchItem } from "../types/merch";

export const merchCatalogue: MerchItem[] = [
  {
    id: "jersey",
    name: "Official Fest Jersey",
    description: "Premium sports jersey for the ultimate fest experience.",
    price: 499,
    images: ["/merch/jersey-1.jpg"],
    isAvailable: true,
    attributes: [
      {
        id: "playerName",
        label: "Player Name",
        type: "text",
        required: true,
        placeholder: "Enter name to print on back",
      },
      {
        id: "jerseyNumber",
        label: "Jersey Number",
        type: "number",
        required: true,
        placeholder: "0-99",
      },
      {
        id: "size",
        label: "Size",
        type: "select",
        options: ["XS", "S", "M", "L", "XL", "XXL"],
        required: true,
      },
    ],
  },
  {
    id: "hoodie",
    name: "Signature Hoodie",
    description: "Cozy oversized hoodie perfect for the evening events.",
    price: 899,
    images: ["/merch/hoodie-1.jpg"],
    isAvailable: true,
    attributes: [
      {
        id: "size",
        label: "Size",
        type: "select",
        options: ["S", "M", "L", "XL", "XXL"],
        required: true,
      },
      {
        id: "printName",
        label: "Custom Name Print",
        type: "text",
        required: false,
        placeholder: "Leave blank for no name",
      },
    ],
  },
  {
    id: "varsity-jacket",
    name: "Varsity Jacket",
    description: "Classic college varsity jacket with premium embroidery.",
    price: 1299,
    images: ["/merch/varsity-jacket-1.jpg"],
    isAvailable: true,
    attributes: [
      {
        id: "name",
        label: "Name on Chest",
        type: "text",
        required: true,
        placeholder: "Name",
      },
      {
        id: "size",
        label: "Size",
        type: "select",
        options: ["S", "M", "L", "XL", "XXL"],
        required: true,
      },
      {
        id: "patchText",
        label: "Custom Patch Text",
        type: "text",
        required: false,
        placeholder: "Text for chest patch",
      },
    ],
  },
];
