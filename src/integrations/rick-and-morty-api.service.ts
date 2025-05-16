import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CHARACTER_API } from 'src/utilities/constants';

@Injectable()
export class RickAndMortyApiService {
    private readonly baseUrl = CHARACTER_API;

    async fetchFromAPI(endpoint: string, params: any = {}) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            console.log('Fetching from URL:', url);
            const response = await axios.get(url, {
                params,
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching from Rick and Morty API (${endpoint}):`, error);
            throw error;
        }
    }

    async fetchAllPages(endpoint: string, params: any = {}) {
        let allResults: any[] = [];
        let nextPage = `${endpoint}`;

        try {
            while (nextPage) {
                const response = await this.fetchFromAPI(nextPage, params);
                if (response.results && Array.isArray(response.results)) {
                    allResults = [...allResults, ...response.results];
                }
                nextPage = response.info && response.info.next
                    ? response.info.next.replace(this.baseUrl, '')
                    : null;

                // Clear params after first request to avoid duplicate query params
                params = {};
            }
            return allResults;
        } catch (error) {
            console.error(`Error fetching all pages from API (${endpoint}):`, error);
            return allResults; // Return any results collected before error
        }
    }

    async getCharactersByFilters(filters: any) {
        console.log('Executing API getCharactersByFilters', filters);
        const params = {};
        if (filters.name) params['name'] = filters.name;
        if (filters.status) params['status'] = filters.status;
        if (filters.species) params['species'] = filters.species;
        if (filters.type) params['type'] = filters.type;
        if (filters.gender) params['gender'] = filters.gender;

        // La API no soporta filtrar por origin directamente
        // Lo haremos manualmente después de obtener los resultados
        console.log('Params value to fetch: ', params);
        try {
            // Fetch all pages only if no name filter (which tends to be more specific)
            // to avoid unnecessary requests for specific searches
            let results;
            if (!filters.name && !filters.status && !filters.species && !filters.type && !filters.gender) {
                console.log('Not filters present, fetching all pages for characters');
                results = await this.fetchAllPages('/character', params);
            } else {
                console.log('Filters present, fetching specific characters');
                const response = await this.fetchFromAPI('/character', params);
                console.log('Response from API:', response);
                results = response.results || [];
            }

            // Filtrar por origen si se especificó
            if (filters.origin && results.length > 0) {
                results = results.filter(character =>
                    character.origin &&
                    character.origin.name &&
                    character.origin.name.toLowerCase().includes(filters.origin.toLowerCase())
                );
            }

            console.log('Results from method:', results);

            return results;
        } catch (error) {
            console.error('Error in getCharactersByFilters:', error);
            return [];
        }
    }

    async getLocationsByFilters(filters: any) {
        const params = {};
        if (filters.name) params['name'] = filters.name;
        if (filters.type) params['type'] = filters.type;
        if (filters.dimension) params['dimension'] = filters.dimension;

        try {
            // Fetch all pages only if no name filter to avoid unnecessary requests
            let results;
            if (!filters.name && !filters.type && !filters.dimension) {
                results = await this.fetchAllPages('/location', params);
            } else {
                const response = await this.fetchFromAPI('/location', params);
                results = response.results || [];
            }

            return results;
        } catch (error) {
            console.error('Error in getLocationsByFilters:', error);
            return [];
        }
    }

    async getEpisodesByFilters(filters: any) {
        const params = {};
        if (filters.name) params['name'] = filters.name;
        if (filters.episode) params['episode'] = filters.episode;

        try {
            // Fetch all pages only if no specific filters to avoid unnecessary requests
            let results;
            if (!filters.name && !filters.episode) {
                results = await this.fetchAllPages('/episode', params);
            } else {
                const response = await this.fetchFromAPI('/episode', params);
                results = response.results || [];
            }

            return results;
        } catch (error) {
            console.error('Error in getEpisodesByFilters:', error);
            return [];
        }
    }

    async getCharacterById(id: number) {
        const response = await this.fetchFromAPI(`/character/${id}`);
        return response;
    }

    async getLocationById(id: number) {
        const response = await this.fetchFromAPI(`/location/${id}`);
        return response;
    }

    async getEpisodeById(id: number) {
        const response = await this.fetchFromAPI(`/episode/${id}`);
        return response;
    }

    async getMultipleEpisodes(ids: number[]) {
        if (ids.length === 0) return [];
        const idsString = ids.join(',');
        const response = await this.fetchFromAPI(`/episode/${idsString}`);
        return Array.isArray(response) ? response : [response];
    }

    async getMultipleLocations(ids: number[]) {
        if (ids.length === 0) return [];
        const idsString = ids.join(',');
        const response = await this.fetchFromAPI(`/location/${idsString}`);
        return Array.isArray(response) ? response : [response];
    }

    async getMultipleCharacters(ids: number[]) {
        if (ids.length === 0) return [];
        const idsString = ids.join(',');
        const response = await this.fetchFromAPI(`/character/${idsString}`);
        return Array.isArray(response) ? response : [response];
    }
}
