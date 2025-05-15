import { Test } from '@nestjs/testing';
import { CharacterService } from './src/modules/character/character.service';
import { LocationService } from './src/modules/location/location.service';
import { EpisodeService } from './src/modules/episode/episode.service';
import { AppModule } from './src/app.module';

async function runTests() {
    console.log('Starting Rick and Morty API tests...');

    const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    const characterService = moduleRef.get<CharacterService>(CharacterService);
    const locationService = moduleRef.get<LocationService>(LocationService);
    const episodeService = moduleRef.get<EpisodeService>(EpisodeService);

    // Test 1: Search characters by name
    console.log('\nTest 1: Search characters by name "Rick"');
    const rickCharacters = await characterService.getCharactersByFilters({ name: 'Rick' });
    console.log(`Found ${rickCharacters.length} characters with name containing "Rick"`);
    if (rickCharacters.length > 0) {
        console.log('First character found:', rickCharacters[0].name);
    }

    // Test 2: Search characters by status
    console.log('\nTest 2: Search characters by status "Alive"');
    const aliveCharacters = await characterService.getCharactersByFilters({ status: 'Alive' });
    console.log(`Found ${aliveCharacters.length} characters with status "Alive"`);

    // Test 3: Search characters by species
    console.log('\nTest 3: Search characters by species "Human"');
    const humanCharacters = await characterService.getCharactersByFilters({ species: 'Human' });
    console.log(`Found ${humanCharacters.length} characters with species "Human"`);

    // Test 4: Search characters by gender
    console.log('\nTest 4: Search characters by gender "Female"');
    const femaleCharacters = await characterService.getCharactersByFilters({ gender: 'Female' });
    console.log(`Found ${femaleCharacters.length} characters with gender "Female"`);

    // Test 5: Search characters by origin
    console.log('\nTest 5: Search characters by origin "Earth"');
    const earthCharacters = await characterService.getCharactersByFilters({ origin: 'Earth' });
    console.log(`Found ${earthCharacters.length} characters with origin containing "Earth"`);
    if (earthCharacters.length > 0) {
        console.log('First character found:', earthCharacters[0].name);
        console.log('Origin:', earthCharacters[0].origin?.name);
    }

    // Test 6: Search locations
    console.log('\nTest 6: Search locations by name "Earth"');
    const earthLocations = await locationService.getLocationsByFilters({ name: 'Earth' });
    console.log(`Found ${earthLocations.length} locations with name containing "Earth"`);
    if (earthLocations.length > 0) {
        console.log('First location found:', earthLocations[0].name);
    }

    // Test 7: Search episodes
    console.log('\nTest 7: Search episodes by name "Rick"');
    const rickEpisodes = await episodeService.getEpisodesByFilters({ name: 'Rick' });
    console.log(`Found ${rickEpisodes.length} episodes with name containing "Rick"`);
    if (rickEpisodes.length > 0) {
        console.log('First episode found:', rickEpisodes[0].name);
    }

    // Test 8: Verify caching (should be faster second time)
    console.log('\nTest 8: Testing cache functionality');
    console.time('First query');
    await characterService.getCharactersByFilters({ name: 'Morty' });
    console.timeEnd('First query');

    console.time('Second query (should be faster if cached)');
    await characterService.getCharactersByFilters({ name: 'Morty' });
    console.timeEnd('Second query (should be faster if cached)');

    console.log('\nAll tests completed!');
}

runTests().catch(error => {
    console.error('Test error:', error);
});
