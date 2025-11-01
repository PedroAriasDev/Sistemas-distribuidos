import Image from "next/image";

export default function Home() {
  return (
    <div className='centrado'>
      <h1>Mi first page</h1>
      <p>Hello, World! This is my first page, a new adventures beggins :)</p>
      <img 
      src="/20251101_150009.jpg"
      alt="Photo of a happy dev"
      width={500}
      height={600}
      
      />
    </div>
  );
}
