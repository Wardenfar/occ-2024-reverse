# Quantum Encryptor

## Description

Après l'IA, au tour de l'informatique quantique de se démocratiser.<br>
Une startup française est à la pointe dans ce domaine © Encripteria !<br>
Leur produit phare est un chiffreur qui ne contient pas de clé.<br>
Avant chaque chiffrement, la clé est acquise grâce a un système complexe utilisant l'intrication quantique.<br>
La startup assure qu'il est impossible de récuperer la clé car elle se "téléporte" mais vous êtes un peu sceptique.<br>
Récupérez la clé de chiffrement utilisée ! 

`NOTE :` Ce n'est pas un chall crypto :)<br>
`NOTE #2 :` Un grand sage a dit : `Work smarter not harder`

## Solution

Le binaire donné en entrée est volontairement "difficile" a reverse, il n'a aucun symbol et ne dépend d'aucune lib externe.

En l'exécutant, il demande un message a chiffré et après un petit moment, fourni le résultat.

Selon la description, il faut récupérer la clé de chiffrement utilisée.

Malheureusement l'intrication quantique n'est pas encore aussi avancée donc la clé est quelque part en "dur" dans le binaire. De plus lors du chiffrement, la clé doit être transférée dans les registres pour pouvoir être utilisée.

Le but de ce challenge est de le résoudre en boîte noir, c'est à dire, uniquement en regardant ce qui se passe lors de l'exécution sans chercher à le décompiler.

Il existe plusieurs outils pour obtenir la valeur des registres à chaque instants du programme, j'utilise QEMU pour la suite.

Le mode utilisateur de QEMU permet d'émuler un programme avec une couche de traduction de syscall avec le kernel hôte.

La commande ci-dessous permet de  :

```bash
# Log l'état du CPU à chaque instruction
qemu-x86_64 -d cpu ./quantum_encryptor 2> cpu_logs.txt
# Cherche le format du flag dans les logs
grep $(echo -n "OCC{" | xxd -ps) -C 3 cpu_logs.txt

...
RAX=0000000005f5e100 RBX=00005555555b2137 RCX=0000000000000000 RDX=5f7741735f763352
RSI=00007b3a06a2df30 RDI=00007b3a06a2df30 RBP=00005555555add0a RSP=00007b3a06a2d8e8
R8 =0000000000000000 R9 =0000000000000000 R10=4f43437b7468335f R11=683472645f773459
R12=00005555555b24f7 R13=0000000000000000 R14=00007b3a06a2df30 R15=7fffffffffffffff
...
```

En cherchant dans les logs, le flag n'apparait pas en entier. Il manque la dernière moitiée.

QEMU n'émule pas les instructions "bêtement" une par une, mais recompile des blocs d'instruction grâce a un compilateur temps réel (JIT).

La commande précédente ne log que à chaque fin de "Translation Block" (TB).
En désactivant ce comportement, on obtiens le flag entier !

```bash
# Log l'état du CPU à chaque instruction
qemu-x86_64 -one-insn-per-tb -d cpu ./quantum_encryptor 2> cpu_logs.txt
# Cherche le format du flag dans les logs
grep $(echo -n "OCC{" | xxd -ps) -A 1 cpu_logs.txt

...
R10=4f43437b7468335f R11=683472645f773459 R12=5f7741735f763352 R13=795f68617264217d
...
```

```
4f43437b7468335f 683472645f773459 5f7741735f763352 795f68617264217d
=>
OCC{th3_h4rd_w4Y_wAs_v3Ry_hard!}
```