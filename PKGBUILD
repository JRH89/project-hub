# Maintainer: Your Name <your.email@example.com>
pkgname=project-hub
pkgver=1.0.0
pkgrel=1
pkgdesc="A lightweight desktop application to organize complex projects with scattered files"
arch=('x86_64')
url="https://github.com/yourusername/project-hub"
license=('MIT')
depends=('electron')
makedepends=('npm')
source=("$pkgname-$pkgver.tar.gz::https://github.com/yourusername/project-hub/archive/v$pkgver.tar.gz")
sha256sums=('SKIP')

build() {
    cd "$srcdir/$pkgname-$pkgver"
    npm install
    npm run build
}

package() {
    cd "$srcdir/$pkgname-$pkgver"
    
    # Install application files
    install -dm755 "$pkgdir/usr/lib/$pkgname"
    cp -r dist electron node_modules "$pkgdir/usr/lib/$pkgname/"
    
    # Install icon
    install -Dm644 public/icon.png "$pkgdir/usr/share/pixmaps/$pkgname.png"
    
    # Create desktop entry
    install -Dm644 /dev/stdin "$pkgdir/usr/share/applications/$pkgname.desktop" <<EOF
[Desktop Entry]
Name=Project Hub
Comment=Organize complex projects with scattered files
Exec=/usr/bin/$pkgname
Icon=$pkgname
Type=Application
Categories=Utility;Development;
EOF
    
    # Create launcher script
    install -Dm755 /dev/stdin "$pkgdir/usr/bin/$pkgname" <<EOF
#!/bin/sh
cd /usr/lib/$pkgname
exec electron . "\$@"
EOF
}
