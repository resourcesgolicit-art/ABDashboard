import React from "react";

interface EBookViewerProps {
  images: string[];
}

const EBookViewer: React.FC<EBookViewerProps> = ({ images }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold mb-4 text-center">E-Book Reader</h2>
      <div className="overflow-y-auto h-[75vh] border border-gray-200 rounded-md p-2">
        {images.map((img, index) => (
          <div key={index} className="mb-6 flex justify-center">
            <img
              src={img}
              alt={`Page ${index + 1}`}
              className="rounded-md shadow-md w-full max-w-[600px]"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EBookViewer;
