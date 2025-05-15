export class CreateCharacterDto {
    name: string;
    status: string;
    species: string;
    type: string;
    gender: string;
    image: string;
    url: string;
    originId?: number;
    locationId?: number;
}
