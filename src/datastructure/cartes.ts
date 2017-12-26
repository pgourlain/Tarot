import {Card} from '../enums/Card';

const cartes: Card[] = [];

['C', 'K', 'P', 'T'].forEach(color => {
    for (let i = 1; i <= 10; i++) {
        cartes.push(color + i);
    }
    cartes.push(color + 'V');
    cartes.push(color + 'C');
    cartes.push(color + 'D');
    cartes.push(color + 'R');
});
for (let i = 1; i <= 21; i++) {
    cartes.push('A' + i);
}
cartes.push('J');

export const TarotCartes = cartes;
