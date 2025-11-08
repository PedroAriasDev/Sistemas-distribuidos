'use client'
import Image from "next/image";
import {useState,useEffect} from "react";

export default function PokemonList() {
  interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  types: Array<{ type: { name: string } }>;
  }
  interface list {
    name:string;
    url:string
  };

  const [pokemons, setPokemon] = useState<Pokemon[]>([]);
  const [loading,setLoading]=useState(true);
  const [clicks, setClicks] = useState<Record<number, number>>({});

  useEffect(() => {
    async function fetchPokemons() {
      // 1. Obtener lista
      const axios = require('axios');
      const firstResponse = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=20');
      const pokemonList = firstResponse.data.results;
    
      // 2. Crear array de promesas (una por cada pokemon)
      const promises = pokemonList.map((pokemon:list) => 
        axios.get(pokemon.url)
      );
    
      // 3. Esperar todas las promesas
      const responses = await Promise.all(promises);
    
      // 4. Extraer los datos
      const detailedPokemons:Pokemon[]= responses.map((responses) => responses.data);
    
      // 5. Guardar en estado
      setPokemon(detailedPokemons);
      setLoading(false);
    }
    fetchPokemons();
  }, [])  
  
  const handleClick = (pokemonId: number) => {
    setClicks({
      ...clicks,
      [pokemonId]: (clicks[pokemonId] || 0) + 1
    });
  };

  const getTypeColor = (typeName: string) => {
    const colors: Record<string, string> = {
      fire: 'type-fire',
      water: 'type-water',
      grass: 'type-grass',
      electric: 'type-electric',
      psychic: 'type-psychic',
      ice: 'type-ice',
      dragon: 'type-dragon',
      dark: 'type-dark',
      fairy: 'type-fairy',
      normal: 'type-normal',
      fighting: 'type-fighting',
      flying: 'type-flying',
      poison: 'type-poison',
      ground: 'type-ground',
      rock: 'type-rock',
      bug: 'type-bug',
      ghost: 'type-ghost',
      steel: 'type-steel',
    };
    return colors[typeName] || 'type-normal';
  };

  if(loading){
    return <div className="centrada">Cargando...</div>
  }

  return (
  <div className="pokemon-list">
    {pokemons.map((pokemon) => (
      <div 
        key={pokemon.id}
        className="pokemon-card"
        onClick={() => handleClick(pokemon.id)}
      >
        <p>#{pokemon.id}</p>
        <p className="pokemon-name">{pokemon.name}</p>
        <img src={pokemon.sprites.front_default} alt={pokemon.name} />
        <p className={`pokemon-type ${getTypeColor(pokemon.types[0].type.name)}`}>
          {pokemon.types[0].type.name}
        </p>
        <p className="click-count">Clicks: {clicks[pokemon.id] || 0}</p>
      </div>
    ))}
  </div>
)
}
